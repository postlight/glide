import { IS_EMPTY, isEmpty, notEmpty } from "./util";

const isEmptyImpl = jest.fn().mockReturnValue(false);
const subject = { [IS_EMPTY]: isEmptyImpl };

beforeEach(() => {
  isEmptyImpl.mockClear();
});

test("isEmpty()", () => {
  expect(isEmpty(subject)).toBe(false);
  expect(isEmptyImpl).toHaveBeenCalled();
});

test("notEmpty()", () => {
  expect(notEmpty(subject)).toBe(true);
  expect(isEmptyImpl).toHaveBeenCalled();
});
