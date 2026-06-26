// aiService and vectordb load the Groq client / mongoose models at
// require-time; a placeholder key lets us require them to test pure helpers.
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-dummy-key';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { stripFences } = require('../services/aiService');
const { detectCategory } = require('../config/vectordb');

test('stripFences removes ```html / ```json code fences', () => {
  assert.equal(stripFences('```html\n<p>Hi</p>\n```'), '<p>Hi</p>');
  assert.equal(stripFences('```json\n[]\n```'), '[]');
});

test('stripFences leaves clean content untouched', () => {
  assert.equal(stripFences('<h2>Scope</h2>'), '<h2>Scope</h2>');
});

test('detectCategory routes prompts to the right contract category', () => {
  assert.equal(detectCategory('Build a React + Node web app'), 'web_development');
  assert.equal(detectCategory('Design a logo and brand kit in Figma'), 'design');
  assert.equal(detectCategory('Write 4 SEO blog articles per month'), 'content_writing');
  assert.equal(detectCategory('Native iOS and Android mobile app'), 'mobile_development');
  assert.equal(detectCategory('Provide business strategy advisory'), 'consulting');
  assert.equal(detectCategory('Something completely unrelated'), 'other');
});

test('detectCategory tolerates empty/undefined input', () => {
  assert.equal(detectCategory(''), 'other');
  assert.equal(detectCategory(undefined), 'other');
});
