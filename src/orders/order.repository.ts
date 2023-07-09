import { CustomRepository } from '../repository/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { RequestCreateOrderDto } from './dto/request.create-order.dto';
import { User } from '../auth/user.entity';
import { ResponseCreateOrderDto } from './dto/response.create-order.dto';
import { Cart } from '../carts/cart.entity';
import { Payment } from './payment.entity';
import { Shipment } from './shipment.entity';
import { generateNumber } from '../utils/number-generator';
import { OrderStatus } from './order-status.entity';
import { Option } from '../items/option.entity';
import { PAYMENT_METHOD } from '../utils/constants/payment-method.enum';
import { ORDER_STATUS } from '../utils/constants/order-status.enum';
import { NotFoundException } from '@nestjs/common';
import { RANDOM_NUMBER } from '../utils/constants/random-number.enum';

@CustomRepository(Order)
export class OrderRepository extends Repository<Order> {
  async createOrder(
    requestCreateOrderDto: RequestCreateOrderDto,
    user: User,
  ): Promise<ResponseCreateOrderDto> {
    const { name, street, address, zipcode, email, phoneNumber } =
      requestCreateOrderDto;

    let orderNumber = '';

    await this.manager.transaction(async (manager) => {
      const carts = await manager.find(Cart, {
        where: { user: { id: user.id } },
        relations: { options: true },
      });

      const [orderStatus] = await manager.find(OrderStatus, {
        where: { status: 'PAID' },
      });

      const cartIds = carts.map((cart) => {
        return cart.id;
      });

      const totalQuantity = carts
        .map((cart) => {
          return cart.totalQuantity;
        })
        .reduce((total, quantity) => {
          return total + quantity;
        }, 0);

      const totalPrice = carts
        .map((cart) => {
          return Number(cart.totalPrice);
        })
        .reduce((total, price) => {
          return total + price;
        }, 0.0);

      for (let cartIndex = 0; cartIndex < carts.length; cartIndex++) {
        const cart = carts[cartIndex];
        const [option] = await manager.find(Option, {
          where: { id: cart.options[0].id },
        });
        option.stock -= cart.totalQuantity;

        if (option.stock < 0) {
          throw new NotFoundException('Out of stock');
        }

        await manager.update(Option, option.id, { stock: option.stock });
      }

      const options: Option[] = [];

      for (let cartIndex = 0; cartIndex < carts.length; cartIndex++) {
        const cart = carts[cartIndex];
        const [option] = await manager.find(Option, {
          where: { id: cart.options[0].id },
        });
        options.push(option);
      }

      const newOrder = manager.create(Order, {
        totalQuantity: totalQuantity,
        totalPrice: totalPrice,
        orderNumber: generateNumber(RANDOM_NUMBER.ORDER),
        orderStatus: orderStatus,
        user: user,
        options: options,
      });

      await manager.save(Order, newOrder);

      const [order] = await manager.find(Order, {
        where: { orderNumber: newOrder.orderNumber },
      });
      orderNumber = order.orderNumber;

      const payment = manager.create(Payment, {
        paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
        totalAmount: totalPrice,
        paymentNumber: generateNumber(RANDOM_NUMBER.PAYMENT),
        order: order,
      });

      const shipment = manager.create(Shipment, {
        name: name,
        street: street,
        address: address,
        zipcode: zipcode,
        email: email,
        phoneNumber: phoneNumber,
        detail: '세부사항',
        trackingNumber: generateNumber(RANDOM_NUMBER.SHIPMENT),
        order: order,
      });

      await manager.save(Payment, payment);
      await manager.save(Shipment, shipment);
      await manager.delete(Cart, cartIds);
    });

    const order = await this.createQueryBuilder('order')
      .select([
        'order.total_quantity AS total_quantity',
        'order.total_price AS total_price',
        'order.order_number AS order_number',
        'order.order_date AS order_date',
      ])
      .where('order.order_number = :order_number', {
        order_number: orderNumber,
      })
      .getRawOne();

    const response: ResponseCreateOrderDto = {
      totalQuantity: order.total_quantity,
      totalPrice: order.total_price,
      orderNumber: order.order_number,
      orderDate: order.order_date,
      orderStatus: ORDER_STATUS.PAID,
    };

    return response;
  }
}
