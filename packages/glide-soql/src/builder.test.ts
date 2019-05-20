import { Builder, Select } from "./builder";
import { Bool, Cmp } from "./expr";
import { isEmpty } from "./util";

describe("Builder", () => {
  let subject: Builder;

  beforeEach(() => {
    subject = new Builder(Select.from("User"));
  });

  test("#groupBy()", () => {
    subject.groupBy("LastName");
    expect(subject).toMatchSnapshot();

    subject.groupBy(["LastName", "FirstName"]);
    expect(subject).toMatchSnapshot();
  });

  test("#limit()", () => {
    subject.limit(10);
    expect(subject).toMatchSnapshot();
  });

  test("#offset()", () => {
    subject.offset(10);
    expect(subject).toMatchSnapshot();
  });

  test("#orderBy()", () => {
    subject.orderBy("FirstName");
    expect(subject).toMatchSnapshot();

    subject.orderBy(["FirstName", "LastName"]);
    expect(subject).toMatchSnapshot();
  });

  test("#select()", () => {
    subject.select("FirstName", "LastName");
    expect(subject).toMatchSnapshot();
  });

  test("#toString()", () => {
    const empty = new Builder(Select.from("User"));
    const notEmpty = new Builder(Select.from("User"))
      .select("Id")
      .where(
        Bool.and(
          Cmp.eq("Company", "Postlight"),
          Bool.or(
            Cmp.eq("EmailAddress", "hello@postlight.com"),
            Cmp.eq("PhoneNumber", "+16466948530"),
          ),
        ),
      )
      .groupBy("LastName")
      .orderBy("LastName")
      .limit(10)
      .offset(10);

    expect(`${empty}`).toMatchSnapshot();
    expect(`${notEmpty}`).toMatchSnapshot();
  });

  test("#where()", () => {
    subject.where(Cmp.eq("Id", null));
    expect(subject).toMatchSnapshot();
  });
});

describe("Select", () => {
  let subject: Select;

  beforeEach(() => {
    subject = Select.from("User");
  });

  test("#@@isEmpty()", () => {
    expect(isEmpty(subject)).toBe(true);
    expect(isEmpty(subject.select("Id"))).toBe(false);
  });

  test("#concat()", () => {
    const target = Select.from("Contact").select("Contact.FirstName", "Contact.LastName");
    expect(subject.concat(target)).toMatchSnapshot();
  });

  test("#select()", () => {
    subject.select("FirstName", "LastName");
    expect(subject).toMatchSnapshot();
  });

  test("#toString()", () => {
    const simple = Select.from("User").select("FirstName", "LastName");
    const complex = Select.from("User").select("Id", Select.from("Contact").select("Id"));

    expect(`${simple}`).toMatchSnapshot();
    expect(`${complex}`).toMatchSnapshot();
  });
});
