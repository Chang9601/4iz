import { v4 as uuidv4 } from 'uuid';
import { RANDOM_NUMBER } from './constants/random-number.enum';

export function generateNumber(choice: RANDOM_NUMBER) {
  switch (choice) {
    case RANDOM_NUMBER.ORDER:
      return 'ORDER-' + uuidv4();
    case RANDOM_NUMBER.PAYMENT:
      return 'PAYMENT-' + uuidv4();
    case RANDOM_NUMBER.SHIPMENT:
      return 'SHIPMENT-' + uuidv4();
    default:
      return 'NOTHING';
  }
}
