import { createTypedHooks } from "easy-peasy";
import { StoreModel } from "./StoreModel";
import { create } from "domain";
export const {
    useStoreActions,
    useStoreState,
    useStoreDispatch,
    useStore
} = createTypedHooks<StoreModel>();