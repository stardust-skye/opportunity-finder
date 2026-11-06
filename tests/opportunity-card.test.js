import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { transformWithEsbuild } from "vite";

test("opportunity card preserves original artwork and displays only the four requested fields", async () => {
  const componentUrl = new URL("../src/components/OpportunityCard.jsx", import.meta.url);
  const source = await readFile(componentUrl, "utf8");
  const { code } = await transformWithEsbuild(source, componentUrl.pathname, { loader: "jsx", jsx: "automatic" });
  const rewritten = code
    .replace('"react/jsx-runtime"', JSON.stringify(import.meta.resolve("react/jsx-runtime")))
    .replace('"lucide-react"', JSON.stringify(import.meta.resolve("lucide-react")))
    .replace('"react-router-dom"', JSON.stringify(import.meta.resolve("react-router-dom")))
    .replace('"../utils/formatHourlyPay.js"', JSON.stringify(new URL("../src/utils/formatHourlyPay.js", import.meta.url).href));
  const { default: OpportunityCard } = await import(`data:text/javascript;base64,${Buffer.from(rewritten).toString("base64")}`);
  const opportunity = {
    id: "example-id",
    title: "Research title",
    professor: "Professor Example",
    initials: "PE",
    color: "coral",
    location: "Location not specified",
    hourlyPayCents: null,
    description: "Not on the card",
    skills: ["Not a card skill"],
  };
  const render = (item) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(OpportunityCard, { opportunity: item })));
  const html = render(opportunity);
  assert.match(html, /href="\/opportunities\/example-id"/);
  assert.equal((html.match(/<a\b/g) || []).length, 1);
  for (const text of ["Research title", "Professor Example", "Location not specified", "Pay not specified"]) {
    assert.ok(html.includes(text), `Missing ${text}`);
  }
  for (const className of ["card-art--coral", "art-orbit--one", "art-orbit--two", "art-center", "art-spark--one", "professor-avatar--coral"]) {
    assert.ok(html.includes(className), `Missing ${className}`);
  }
  assert.ok(!html.includes(opportunity.description));
  assert.ok(!html.includes(opportunity.skills[0]));
  const paidHtml = render({ ...opportunity, location: "Raleigh", hourlyPayCents: 2050 });
  assert.ok(paidHtml.includes("Raleigh"));
  assert.ok(paidHtml.includes("$20.50 / hour"));
});
