import { describe, expect, it } from "vitest";

import { addListener, getElement, toAttrs, toElement } from "./dom.ts";

describe("addListener", () => {
  it("should add an event listener and call it", () => {
    const button = document.createElement("button");
    let called = false;
    addListener(button, "click", () => {
      called = true;
    });
    button.click();
    expect(called).toBe(true);
  });

  it("should not throw if adding to a valid element", () => {
    const div = document.createElement("div");
    expect(() => {
      addListener(div, "mouseenter", () => {
        // Do things
      });
    }).not.toThrow();
  });
});

describe("getElement", () => {
  it("should return the element if it exists", () => {
    const baseEl = document.createElement("div");
    const div = document.createElement("div");
    baseEl.appendChild(div);
    div.id = "test";
    const el = getElement<HTMLDivElement>("#test", baseEl);
    expect(el).toBe(div);
  });

  it("should throw if the element does not exist", () => {
    const baseEl = document.createElement("div");
    expect(() => getElement<HTMLDivElement>("#does-not-exist", baseEl)).toThrow(
      "Could not find element"
    );
  });
});

describe("toAttrs", () => {
  it("should convert attributes to string", () => {
    expect(toAttrs({ id: "foo", class: "bar" })).toBe('id="foo" class="bar"');
  });

  it("should include key only if value is null", () => {
    expect(toAttrs({ disabled: null, id: "foo" })).toBe('disabled id="foo"');
  });

  it("should return empty string for empty object", () => {
    expect(toAttrs({})).toBe("");
  });

  it("should escape double quotes in attribute values", () => {
    expect(toAttrs({ title: 'say "hi"' })).toBe('title="say &quot;hi&quot;"');
  });

  it("should escape ampersands in attribute values", () => {
    expect(toAttrs({ title: "fish & chips" })).toBe('title="fish &amp; chips"');
  });

  it("should round-trip an escaped value through toElement without breaking out of the attribute", () => {
    const attrs = toAttrs({ title: 'say "hi" & bye' });
    const el = toElement(`<div ${attrs}></div>`);
    expect(el.getAttribute("title")).toBe('say "hi" & bye');
  });
});

describe("toElement", () => {
  it("should create an element from a valid tag string", () => {
    const el = toElement("<div>hello</div>");
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(el.textContent).toBe("hello");
  });

  it("should create an element from a known tag", () => {
    const el = toElement("<button>Click</button>");
    expect(el).toBeInstanceOf(HTMLButtonElement);
    expect(el.textContent).toBe("Click");
  });

  it("should throw if no nodes found", () => {
    expect(() => toElement("")).toThrow("No nodes found");
    expect(() => toElement("   ")).toThrow("No nodes found");
  });

  it("should infer the concrete element type for a digit-bearing tag name", () => {
    const el = toElement("<h1>Title</h1>");
    expect(el).toBeInstanceOf(HTMLHeadingElement);
    expect(el.textContent).toBe("Title");
  });

  it("should fallback to HTMLElement for unknown tags", () => {
    const el = toElement("<custom-elem></custom-elem>");
    expect(el).toBeInstanceOf(HTMLElement);
    expect(el.tagName.toLowerCase()).toBe("custom-elem");
  });

  it("should create an SVG root element directly", () => {
    const el = toElement("<svg><circle cx='5' cy='5' r='5'></circle></svg>");
    expect(el).toBeInstanceOf(SVGSVGElement);
    expect(el.children.item(0)).toBeInstanceOf(SVGCircleElement);
  });

  it("should wrap a bare SVG (non-root) element so it parses into the SVG namespace", () => {
    const el = toElement("<circle cx='5' cy='5' r='5'></circle>");
    expect(el).toBeInstanceOf(SVGCircleElement);
    expect(el.namespaceURI).toBe("http://www.w3.org/2000/svg");
  });

  it("should fix up a lowercase-written camelCase SVG tag name", () => {
    const el = toElement("<lineargradient></lineargradient>");
    expect(el).toBeInstanceOf(SVGLinearGradientElement);
    expect(el.tagName).toBe("linearGradient");
  });

  it("should prefer the HTML variant for tag names shared with SVG", () => {
    const a = toElement("<a href='#'>hi</a>");
    expect(a).toBeInstanceOf(HTMLAnchorElement);

    const title = toElement("<title>hi</title>");
    expect(title).toBeInstanceOf(HTMLTitleElement);
  });

  it("should attempt to wrap a bare MathML (non-root) element in a math namespace", () => {
    // happy-dom has no MathML support, so this only verifies the wrapping logic runs
    // and unwraps the right node; it can't assert the resulting namespace/interface.
    const el = toElement("<mi>x</mi>");
    expect(el.tagName.toLowerCase()).toBe("mi");
    expect(el.textContent).toBe("x");
  });
});
