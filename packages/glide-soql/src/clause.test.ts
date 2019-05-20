import { GroupBy, Limit, Offset, OrderBy, Where } from "./clause";
import { Bool, Cmp, Fn } from "./expr";
import { isEmpty } from "./util";

describe("GroupBy", () => {
  test("#@@isEmpty()", () => {
    expect(isEmpty(new GroupBy())).toBe(true);
    expect(isEmpty(new GroupBy(["FirstName"]))).toBe(false);
  });

  test("#toString()", () => {
    const condition = Bool.and(Cmp.gt(Fn.count("Name"), 100), Cmp.eq("LeadSource", "Phone"));

    expect(`${new GroupBy(["LeadSource"])}`).toMatchSnapshot();
    expect(`${new GroupBy(["LeadSource"], condition)}`).toMatchSnapshot();
  });
});

describe("Limit", () => {
  test("#@@isEmpty()", () => {
    expect(isEmpty(new Limit())).toBe(true);
    expect(isEmpty(new Limit(10))).toBe(false);
  });

  test("#toString()", () => {
    expect(`${new Limit(10)}`).toMatchSnapshot();
  });
});

describe("Offset", () => {
  test("#@@isEmpty()", () => {
    expect(isEmpty(new Offset())).toBe(true);
    expect(isEmpty(new Offset(10))).toBe(false);
  });

  test("#toString()", () => {
    expect(`${new Offset(10)}`).toMatchSnapshot();
  });
});

describe("OrderBy", () => {
  test("#@@isEmpty()", () => {
    expect(isEmpty(new OrderBy())).toBe(true);
    expect(isEmpty(new OrderBy(["FirstName"]))).toBe(false);
  });

  test("#toString()", () => {
    expect(`${new OrderBy(["FirstName"])}`).toMatchSnapshot();
    expect(`${new OrderBy(["FirstName"], "ASC")}`).toMatchSnapshot();
    expect(`${new OrderBy(["FirstName"], "DESC")}`).toMatchSnapshot();
  });
});

describe("Where", () => {
  const condition = Cmp.eq("EmailAddress", "hello@postlight.com");

  test("#@@isEmpty()", () => {
    expect(isEmpty(new Where())).toBe(true);
    expect(isEmpty(new Where(condition))).toBe(false);
  });

  test("#toString()", () => {
    expect(`${new Where(condition)}`).toMatchSnapshot();
  });
});
