import soql, { from } from "./lib";

test("soql()", () => {
  expect(soql("User")).toMatchSnapshot();
  expect(soql(from("User"))).toMatchSnapshot();
});
