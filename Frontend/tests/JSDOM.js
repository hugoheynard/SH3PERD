import {JSDOM} from "jsdom";

const dom = new JSDOM(`<!DOCTYPE html>`);
const document = dom.window.document;