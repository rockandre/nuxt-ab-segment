<h1 align="center">
  nuxt-ab-segment
</h1>
<p align="center">
  NuxtJS module for A/B testing with Segment Analytics<br />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nuxt-ab-segment"><img src="https://img.shields.io/npm/v/nuxt-ab-segment?style=flat-square"></a> <a href="https://www.npmjs.com/package/nuxt-ab-segment"><img src="https://img.shields.io/npm/dt/nuxt-ab-segment?style=flat-square"></a> <a href="#"><img src="https://img.shields.io/github/license/dogchef-be/nuxt-ab-segment?style=flat-square"></a>
</p>
<br />

## Table of contents

- [Main features](#main-features)
- [Dependencies](#dependencies)
- [Setup](#setup)
- [Options](#options)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)

## Main features

- Run multiple experiments simultaneously
- TypeScript support
- Cookies to persist variants across users
- Force a specific variant via url or param. E.g. `url?abs_experiment-x=1` or `this.$abtest('experiment-x', 1);`
- Disable all a/b tests by cookie (`abs_disabled=1`), which is useful for E2E tests in CI/CD pipelines

## Dependencies

- [nuxt-segment](https://github.com/dansmaculotte/nuxt-segment)
- Or any other alternative to inject [Segment Analytics](https://segment.com)

## Setup

1. Add `nuxt-ab-segment` dependency to your project:

```bash
npm install nuxt-ab-segment
```

2. Add `nuxt-ab-segment` module and configuration to `nuxt.config.js`:

```js
export default {
  // ...other config options
  modules: ["nuxt-ab-segment"];
  abSegment: {
    event: "AB Test", // optional
    experiments: '~/experiments.js', // optional
  }
}
```

3. Create the `experiments.js` in project's root with an array of your experiments. An example:

```js
/**
 * {
 *  name: string; A name to identify the experiment on this.$abtest('NAME_HERE')
 *  maxAgeDays: number; Number of days to persist the cookie of user's active variant
 *  variants: number[]; An array of variants weights
 * }
 */
module.exports = [
  {
    name: "experiment-x",
    maxAgeDays: 15,
    variants: [50, 50],
  },
];
```

4. (Optional) TypeScript support. Add `nuxt-ab-segment` to the `types` section of `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["nuxt-ab-segment"]
  }
}
```

## Options

### `event`

- Type: `String`
- Default: `AB Test`

Event name reported to Segment.

### `experiments`

- Type: `String`
- Default: `~/experiments.js`

File path for your experiments definition.

## Usage

It can be used inside components like:

```js
{
  data: () => ({
    payBtnLabel: null as string | null,
    isScenarioA: true,
  }),
  mounted() {
    // Example 1: normal usage
    const activeVariant = this.$abtest('experiment-x');
    if (activeVariant === 0) {
      this.payBtnLabel = 'Place order';
    } else {
      this.payBtnLabel = 'Pay now!';
    }

    // Example 2: force variant 1
    if (this.isScenarioA) {
      this.$abtest('experiment-y', 1)
      // do something else..
    }
  }
}
```

An example of event properties reported to Segment:

```js
{
  experiment: 'experiment-x',
  variant: 1
}
```

## Credits

- [Brandon Mills](https://github.com/btmills) for `weightedRandom()`

## License

See the LICENSE file for license rights and limitations (MIT).
