import apiClient from './client';

export interface Plan {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  features: string;
}

export interface PaymentOrder {
  payment_id: string;
  gateway: string;
  order_data: Record<string, unknown>;
  amount: number;
  plan_name: string;
}

export const paymentsApi = {
  getPlans: async (): Promise<Plan[]> => {
    const { data } = await apiClient.get('/payments/plans');
    return data;
  },

  createOrder: async (plan_id: string): Promise<PaymentOrder> => {
    const { data } = await apiClient.post('/payments/create-order', { plan_id });
    return data;
  },

  verifyPayment: async (payment_id: string, gateway_payment_id: string, gateway_signature?: string) => {
    const { data } = await apiClient.post('/payments/verify', {
      payment_id,
      gateway_payment_id,
      gateway_signature,
    });
    return data;
  },

  getActiveGateway: async (): Promise<{ active_gateway: string }> => {
    const { data } = await apiClient.get('/payments/active-gateway');
    return data;
  },
};
