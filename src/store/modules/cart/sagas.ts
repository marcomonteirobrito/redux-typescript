import { all, select, takeLatest, call, put } from "redux-saga/effects";
import { addProductToCartRequest } from "./actions";
import { AxiosResponse } from "axios";
import api from "../../../services/api";
import { IState } from "../..";
import {
  addProductToCartSuccess,
  addProductToCartFailure,
} from "../cart/actions";

type CheckProductStockRequest = ReturnType<typeof addProductToCartRequest>;

interface IStockResponse {
  id: number;
  quantity: number;
}

function* checkProductStock({ payload }: CheckProductStockRequest) {
  const { product } = payload;

  const currentQuantity: number = yield select((state: IState) => {
    return (
      state.cart.items.find((item) => item.product.id === product.id)
        ?.quantity ?? 0
    );
  });

  const availableStockResponse: AxiosResponse<IStockResponse> = yield call(
    api.get,
    `stock/${product.id}`
  );

  if (availableStockResponse.data.quantity > currentQuantity) {
    yield put(addProductToCartSuccess(product));
  } else {
    yield put(addProductToCartFailure(product.id));
  }
}

export default all([
  takeLatest("ADD_PRODUCT_TO_CART_REQUEST", checkProductStock),
]);
