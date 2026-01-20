export interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface MidtransCustomerDetails {
  first_name: string;
  email: string;
  phone?: string;
}

export interface MidtransItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransPayload {
  transaction_details: MidtransTransactionDetails;
  customer_details?: MidtransCustomerDetails;
  item_details?: MidtransItemDetails[];
}