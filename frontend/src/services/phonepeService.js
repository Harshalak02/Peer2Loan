import api from "./api";

const phonepeService = {
  initiatePayment: (data) => api.post("/phonepe/pay", data),
  getStatus: (transactionId) => api.get(`/phonepe/status/${transactionId}`),
  autoVerifyPayment: (payload) => api.post("/payments/auto-verify", payload),
};

export default phonepeService;
