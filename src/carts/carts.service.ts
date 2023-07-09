import { Injectable, NotFoundException } from '@nestjs/common';
import { CartsRepository } from './carts.repository';
import { RequestCreateCartDto } from './dto/request.create-cart.dto';
import { Cart } from './cart.entity';
import { RequestUpdateCartDto } from './dto/request.update-cart.dto';
import { User } from '../auth/user.entity';
import { GetCartsDto } from './dto/get-carts.dto';
import { ResponseCreateCartDto } from './dto/response.create-cart.dto';
import { ResponseUpdateCartDto } from './dto/response.update-cart.dto';
import { ItemsRepository } from '../items/items.repository';

@Injectable()
export class CartsService {
  constructor(
    private readonly cartRepository: CartsRepository,
    private readonly itemsRepository: ItemsRepository,
  ) {}

  private async getCartById(id: number, user: User): Promise<Cart> {
    const [cart] = await this.cartRepository.find({
      relations: {
        user: true,
      },
      where: { id: id, user: { id: user.id } },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with id ${id} not found`);
    }

    return cart;
  }

  async createCart(
    requestCreateCartDto: RequestCreateCartDto,
    user: User,
  ): Promise<ResponseCreateCartDto[]> {
    const [item] = await this.itemsRepository.find({
      where: { id: requestCreateCartDto.itemId },
    });

    if (!item) {
      throw new NotFoundException(
        `Item with id ${requestCreateCartDto.itemId} not found`,
      );
    }

    return this.cartRepository.createCart(requestCreateCartDto, user);
  }

  async getCarts(
    limit: number,
    offset: number,
    user: User,
  ): Promise<GetCartsDto> {
    return this.cartRepository.getCarts(limit, offset, user);
  }

  async deleteCart(id: number, user: User): Promise<void> {
    const result = await this.cartRepository.delete({
      id,
      user: { id: user.id },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Cart with id ${id} not found`);
    }
  }

  async updateCart(
    id: number,
    requestUpdateCartDto: RequestUpdateCartDto,
    user: User,
  ): Promise<ResponseUpdateCartDto> {
    const cart = await this.getCartById(id, user);

    const price = cart.totalPrice / cart.totalQuantity;
    cart.totalQuantity = requestUpdateCartDto.quantity;
    cart.totalPrice = price * cart.totalQuantity;
    await this.cartRepository.save(cart);

    const responseUpdateCartDto: ResponseUpdateCartDto = {
      id: cart.id,
      totalPrice: cart.totalPrice,
      totalQuantity: cart.totalQuantity,
    };

    return responseUpdateCartDto;
  }
}
