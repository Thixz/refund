type RefundApiResponse = {
  id: string;
  userId: string;
  name: string;
  category: CategoriesAPIEnum;
  amount: number;
  filename: string;
  user: {
    name: string;
  };
};

type RefundsPaginationAPIResponse = {
  refunds: RefundApiResponse[];
  pagination: {
    page: number;
    perPage: number;
    totalRecords: number;
    totalPages: number;
  };
};
