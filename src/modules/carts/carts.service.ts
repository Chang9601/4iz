import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateCartDto } from '../../dtos/create-cart.dto';
import { PaginationDto } from '../../dtos/pagination.dto';
import { UpdateCartDto } from '../../dtos/update-cart.dto';
import { User } from '../../entities/user.entity';
import { ItemsService } from '../items/items.service';
import { CartsRepository } from './carts.repository';

@Injectable()
export class CartsService {
  constructor(
    private readonly cartsRepository: CartsRepository,
    private readonly itemsService: ItemsService,
  ) {}

  async create(createCartDto: CreateCartDto, user: User) {
    const item = await this.itemsService.findOne(createCartDto.itemId);

    return await this.cartsRepository.createOne(createCartDto, item, user);
  }

  async find(pagiantionDto: PaginationDto, user: User) {
    return await this.cartsRepository.findCarts(pagiantionDto, user);
  }

  async findAll(user: User) {
    return await this.cartsRepository.findAll(user);
  }

  async update(id: number, updateCartDto: UpdateCartDto, user: User) {
    const { quantity } = updateCartDto;

    const cart = await this.cartsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!cart) {
      throw new NotFoundException('아이디에 해당하는 장바구니 없음.');
    }

    const price = cart.totalPrice / cart.totalQuantity;
    cart.totalQuantity = quantity;
    cart.totalPrice = price * cart.totalQuantity;

    return await this.cartsRepository.save(cart);
  }

  async delete(id: number, user: User) {
    const cart = await this.cartsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!cart) {
      throw new NotFoundException('아이디에 해당하는 장바구니 없음.');
    }

    return await this.cartsRepository.remove(cart);
  }
}
