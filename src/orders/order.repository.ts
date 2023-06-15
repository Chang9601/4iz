import { CustomRepository } from 'src/db/typeorm-ex.decorator';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { RequestCreateOrderDto } from './dto/request.create-order.dto';
import { User } from 'src/auth/user.entity';
import { ResponseCreateOrderDto } from './dto/response.create-order.dto';
import { Cart } from 'src/carts/cart.entity';
import { Payment } from './payment.entity';
import { Shipment } from './shipment.entity';
import { generateNumber } from 'src/utils/number-generator';
import { OrderStatusLabel, PaymentMethodLabel } from 'src/utils/enum';
import { OrderStatus } from './order-status.entity';
import { Option } from 'src/items/option.entity';
import { InternalServerErrorException } from '@nestjs/common';

@CustomRepository(Order)
export class OrderRepository extends Repository<Order> {
  async createOrder(
    requestCreateOrderDto: RequestCreateOrderDto,
    user: User,
  ): Promise<ResponseCreateOrderDto> {
    const { name, street, address, zipcode, email, phoneNumber } =
      requestCreateOrderDto;

    let orderNumber = 'dummy';

    await this.manager.transaction(async (manager) => {
      const carts = await manager.find(Cart, {
        where: { user: { id: user.id } },
        relations: { options: true },
      });

      const [orderStatus] = await manager.find(OrderStatus, {
        where: { status: '결제완료' },
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
          throw new InternalServerErrorException('Out of stock');
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
        orderNumber: generateNumber('order'),
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
        paymentMethod: PaymentMethodLabel.신용카드,
        totalAmount: totalPrice,
        paymentNumber: generateNumber('payment'),
        order: order,
      });

      const shipment = manager.create(Shipment, {
        name: name,
        street: street,
        address: address,
        zipcode: zipcode,
        email: email,
        phoneNumber: phoneNumber,
        detail: 'detail',
        trackingNumber: generateNumber('shipment'),
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
      orderStatus: OrderStatusLabel.결제완료,
    };

    return response;
  }
}
