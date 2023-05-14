import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { RequestCreateCartDto } from './dto/request.create-cart.dto';
import { Cart } from './cart.entity';
import { UpdateCartDto } from './dto/update-cart.dto';
import { User } from 'src/auth/user.entity';
import { GetCartsDto } from './dto/get-carts-dto';
import { ResponseCreateCartDto } from './dto/response.create-cart.dto';

@Injectable()
export class CartsService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCartById(id: number): Promise<Cart> {
    const [cart] = await this.cartRepository.find({
      relations: {
        user: true,
      },
      where: { id },
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
    const cart = await this.getCartById(id);

    if (cart.user.id != user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    const result = await this.cartRepository.delete({ id });

    if (result.affected === 0) {
      throw new NotFoundException(`Cart with id ${id} not found`);
    }
  }

  async updateCart(
    id: number,
    updateCartDto: UpdateCartDto,
    user: User,
  ): Promise<Cart> {
    const cart = await this.getCartById(id);

    if (cart.user.id != user.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    const price = cart.totalPrice / cart.totalQuantity;
    cart.totalQuantity = updateCartDto.quantity;
    cart.totalPrice = price * cart.totalQuantity;
    await this.cartRepository.save(cart);

    return cart;
  }
}
