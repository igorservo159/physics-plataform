import { IsNotEmpty } from 'class-validator';

export class WebhookDTO {
  order_id: string;

  order_ref: string;

  order_status: string;

  payment_method: string;

  store_id: string;

  payment_merchant_id: string;

  installments: number;

  card_type: string;

  card_last4digits: string;

  card_rejection_reason: string;

  pix_code: string;

  pix_expiration: string;

  boleto_URL: string;

  sale_type: string;

  created_at: string;

  updated_at: string;

  webhook_event_type: string;

  Product: {
    product_id: string;
    product_name: string;
  };

  Customer: {
    full_name: string;
    first_name: string;
    email: string;
    mobile: string;
    CPF: string;
    ip: string;
  };

  Commissions: {
    charge_amount: string;
    product_base_price: string;
    kiwify_fee: string;
    commissioned_stores: Array<{
      id: string;
      type: string;
      custom_name: string;
      email: string;
      value: string;
    }>;
    my_commission: string;
    funds_status: string;
    estimated_deposit_date: string;
    deposit_date: string;
  };

  TrackingParameters: {
    src: string;
    sck: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
  };

  Subscription: {
    id: string;
    start_date: string;
    next_payment: string;
    status: string;
    plan: {
      id: string;
      name: string;
      frequency: string;
      qty_charges: number;
    };
    charges: {
      completed: Array<{
        order_id: string;
        amount: number;
        status: string;
        installments: number;
        card_type: string;
        card_last_digits: string;
        card_first_digits: string;
        created_at: string;
      }>;
      future: Array<{
        charge_date: string;
      }>;
    };
  };

  subscription_id: string;

  access_url: string;
}
