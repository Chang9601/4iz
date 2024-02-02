import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCartDto } from '../../dtos/create-cart.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { PageStateDto } from '../../dtos/page-state.dto';
import { PageDto } from '../../dtos/page.dto';
import { User } from '../../entities/user.entity';
import { Cart } from '../../entities/cart.entity';
import { Item } from '../../entities/item.entity';
import { Option } from '../../entities/option.entity';
import { ICart } from '../../interfaces/types.interface';

export class CartsRepository extends Repository<Cart> {
  constructor(
    @InjectRepository(Cart) private readonly cartsRepository: Repository<Cart>,
  ) {
    // 상속 관계에서 생성자 기반 의존성 주입을 받을 경우 하위 클래스가 super()를 통해 상위 클래스에 필요한 프로바이더를 전달해주어야 한다.
    // 상속 관계에 있지 않은 경우 @Inject() 데코레이터로 속성 기반 주입이 아닌 생성자 기반 주입이 권장된다.
    super(
      cartsRepository.target,
      cartsRepository.manager,
      cartsRepository.queryRunner,
    );
  }

  async createOne(
    createCartDto: CreateCartDto,
    item: Item,
    user: User,
  ): Promise<ICart> {
    const { options } = createCartDto;
    const carts: Cart[] = [];

    // 주의! forEach()는 동기 함수를 기대하며 프로미스를 기다리지 않는다! 따라서 for...of를 사용한다.
    for (const optionStr of options) {
      const [color, size, quantity] = optionStr.split('/');
      const [foundOption] = await this.cartsRepository.manager.find(Option, {
        where: {
          item: {
            id: item.id,
          },
          color,
          size,
        },
      });

      const totalQuantity = parseInt(quantity);
      if (!foundOption || foundOption.stock - totalQuantity < 0) {
        throw new NotFoundException(`옵션 ${foundOption.id} 재고 없음.`);
      }

      const foundCart = await this.cartsRepository.manager.findOne(Cart, {
        where: {
          user: {
            id: user.id,
          },
          options: {
            item: {
              id: item.id,
            },
            color,
            size,
          },
        },
      });

      const discountRate = item.discountRate;
      const rate = (100 - discountRate) / 100;

      if (foundCart) {
        foundCart.totalQuantity += totalQuantity;
        foundCart.totalPrice = foundCart.totalQuantity * (item.price * rate);
        carts.push(foundCart);
      } else {
        const cart = this.cartsRepository.create({
          totalPrice: totalQuantity * (item.price * rate),
          totalQuantity,
          options: [foundOption],
          user,
        });
        carts.push(cart);
      }
    }

    const { totalPrice, totalQuantity } = carts.reduce(
      (total, cart) => ({
        totalPrice: total.totalPrice + cart.totalPrice,
        totalQuantity: total.totalQuantity + cart.totalQuantity,
      }),
      {
        totalPrice: 0,
        totalQuantity: 0,
      },
    );

    await this.cartsRepository.save(carts);

    return { totalPrice, totalQuantity };
  }

  // N+1 문제는 어떤 테이블의 참조된 데이터를 가져오기 위해 테이블 조회(1) + 참조된 데이터 조회(N) 번의 쿼리를 실행하는 문제.
  // N+1 문제는 일반적으로 엔티티 목록을 가져오고 그 목록의 각 엔티티에 대해 관련된 엔터티를 추가로 가져오는 시나리오에서 발생한다.
  // 이로 인해 초기 목록에 있는 엔티티 수를 나타내는 N에 대한 N+1 쿼리가 실행된다.
  async findCarts(paginationDto: PaginationDto, user: User) {
    const { limit: take, skip } = paginationDto;

    const [carts, total] = await this.cartsRepository.findAndCount({
      where: {
        user: {
          id: user.id,
        },
      },
      // relations은 N+1 문제 해결법 중 하나로 JOIN 연산을 실행한다. 연관 엔티티를 한 번의 쿼리로 가져온다.
      // 즉시 로딩 또한 N+1 문제를 해결하는 방법으로 상위 엔티티를 로드할 때 하위 엔티티까지 모두 로드한다.
      relations: ['options'],
      select: ['id', 'totalPrice', 'totalQuantity'],
      order: {
        id: 'ASC',
      },
      take,
      skip,
    });

    const pageStateDto = new PageStateDto(total, paginationDto);

    if (pageStateDto.lastPage < pageStateDto.currentPage) {
      throw new NotFoundException('존재하지 않는 페이지.');
    }

    return new PageDto(pageStateDto, carts);
  }

  // 데이터베이스 구조 수정 필요.
  // 상품의 아이디 배열을 반환한다.
  async findAll(user: User) {
    const id = user.id;
    const carts = await this.cartsRepository.find({
      where: { user: { id } },
      relations: ['options'],
    });

    if (!carts) {
      throw new NotFoundException('사용자에 해당하는 장바구니 목록 없음.');
    }

    const optionIds = carts.map((cart) => cart.options[0].id);
    const itemIds: string[] = [];

    for (const optionId of optionIds) {
      const [foundOption] = await this.cartsRepository.manager.find(Option, {
        where: {
          id: optionId,
        },
        relations: ['item'],
      });

      itemIds.push(foundOption.item.id.toString());
    }

    return itemIds;
  }
}
