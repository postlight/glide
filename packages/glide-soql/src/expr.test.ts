import { Bool, Cmp, Fn } from "./expr";
import { isEmpty } from "./util";

describe("Bool", () => {
  test("constructor()", () => {
    const flat = Bool.and(
      Cmp.eq("EmailAddress", "hello@postlight.com"),
      Bool.and(Cmp.eq("FirstName", "Hello"), Cmp.eq("LastName", "Postlight")),
    );

    const nested = Bool.and(
      Cmp.eq("EmailAddress", "hello@postlight.com"),
      Bool.or(Cmp.eq("FirstName", "Hello"), Cmp.eq("LastName", "Postlight")),
    );

    expect(flat).toMatchSnapshot();
    expect(nested).toMatchSnapshot();
  });

  test("#@@isEmpty()", () => {
    const condition = Cmp.eq("EmailAddress", "hello@postlight.com");

    expect(isEmpty(Bool.and())).toBe(true);
    expect(isEmpty(Bool.and(condition))).toBe(false);
  });

  test("#toString()", () => {
    const subject = Bool.and(
      Cmp.eq("EmailAddress", "hello@postlight.com"),
      Bool.or(Cmp.eq("FirstName", "Hello"), Cmp.eq("LastName", "Postlight")),
    );

    expect(`${subject}`).toMatchSnapshot();
  });
});

describe("Cmp", () => {
  test("#@@isEmpty()", () => {
    expect(isEmpty(Cmp.eq("Id", null))).toBe(false);
  });

  test("#toString()", () => {
    expect(`${Cmp.eq("Id", null)}`).toMatchSnapshot();
    expect(`${Cmp.eq("Active", true)}`).toMatchSnapshot();
    expect(`${Cmp.gt("UsedSpace", BigInt(1e12))}`).toMatchSnapshot();
    expect(`${Cmp.gte("UsedSpace", BigInt(1e12))}`).toMatchSnapshot();
    expect(`${Cmp.in("Company", ["Postlight", "Salesforce"])}`).toMatchSnapshot();
    expect(`${Cmp.like("Company", "%Post%")}`).toMatchSnapshot();
    expect(`${Cmp.ne("Description", "'test'")}`).toMatchSnapshot();
    expect(`${Cmp.notIn("Company", ["Postlight", "Salesforce"])}`).toMatchSnapshot();
    expect(`${Cmp.lt("UsedSpace", 1e12)}`).toMatchSnapshot();
    expect(`${Cmp.lte("UsedSpace", 1e12)}`).toMatchSnapshot();
  });
});

describe("Fn", () => {
  test("#@@isEmpty()", () => {
    expect(isEmpty(Fn.count())).toBe(false);
  });

  test("#toString()", () => {
    expect(`${Fn.avg("UsedSpace")}`).toMatchSnapshot();
    expect(`${Fn.calendarMonth("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.calendarQuarter("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.calendarYear("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.convertTimezone("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.count()}`).toMatchSnapshot();
    expect(`${Fn.count("Id")}`).toMatchSnapshot();
    expect(`${Fn.countDistinct()}`).toMatchSnapshot();
    expect(`${Fn.countDistinct("Id")}`).toMatchSnapshot();
    expect(`${Fn.dayInMonth("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.dayInWeek("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.dayInYear("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.dayOnly("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.fiscalMonth("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.fiscalQuarter("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.fiscalYear("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.hourInDay("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.max("max")}`).toMatchSnapshot();
    expect(`${Fn.min("min")}`).toMatchSnapshot();
    expect(`${Fn.sum("sum")}`).toMatchSnapshot();
    expect(`${Fn.weekInMonth("LastLogin")}`).toMatchSnapshot();
    expect(`${Fn.weekInYear("LastLogin")}`).toMatchSnapshot();
  });
});
