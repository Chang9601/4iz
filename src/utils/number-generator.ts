import { v4 as uuidv4 } from 'uuid';

export function generateNumber(choice: string) {
  switch (choice) {
    case 'order':
      return 'ORDER-' + uuidv4();
    case 'shipment':
      return 'SHIPMENT-' + uuidv4();
    case 'payment':
      return 'PAYMENT-' + uuidv4();
    default:
      return 'NOTHING';
  }
}
