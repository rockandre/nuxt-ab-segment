import Cookies from "js-cookie";
import { Plugin } from "@nuxt/types";

const COOKIE_PREFIX: string = "abs";
const EVENT_NAME: string = "<%= options.event %>";
const EXPERIMENTS: Experiment[] = require("<%= options.experiments %>");

const reported: string[] = [];

function weightedRandom(weights: number[]): string {
  var totalWeight = 0,
    i,
    random;

  for (i = 0; i < weights.length; i++) {
    totalWeight += weights[i];
  }

  random = Math.random() * totalWeight;

  for (i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return i.toString();
    }

    random -= weights[i];
  }

  return "";
}

export function experimentVariant(
  experimentName: string,
  forceVariant?: number
): number {
  const experiment: Experiment | undefined = EXPERIMENTS.find(
    (exp: Experiment) => exp.name === experimentName
  );

  if (experiment === undefined || Cookies.get(`${COOKIE_PREFIX}_disabled`) === '1') {
    return 0;
  }

  const cookieKey = `${COOKIE_PREFIX}_${experimentName}`;

  // Force a specific variant by url or param
  const forceVariantByUrl = window.$nuxt.$route.query[experimentName] as
    | string
    | undefined;

  const variant = forceVariantByUrl ?? forceVariant?.toString() ?? undefined;
  if (variant) {
    Cookies.set(cookieKey, variant, {
      expires: experiment.maxAgeDays,
    });
  }

  // Determine the active variant of the experiment
  let activeVariant: string | number = Cookies.get(cookieKey) || "";

  if (activeVariant.length === 0) {
    const weights: number[] = experiment.variants.map((weight) =>
      weight === undefined ? 1 : weight
    );

    let retries = experiment.variants.length;
    while (activeVariant === "" && retries-- > 0) {
      activeVariant = weightedRandom(weights);
    }

    Cookies.set(cookieKey, activeVariant, {
      expires: experiment.maxAgeDays,
    });
  }

  // Convert active variant into a number type
  activeVariant = Number.parseInt(activeVariant)

  // Let Segment know about the active experiment's variant
  const reportedKey = `${experimentName}_${activeVariant}`;
  if (reported.indexOf(reportedKey) === -1) {
    if (window.analytics) {
      window.analytics.track(EVENT_NAME, {
        experiment: experimentName,
        variant: activeVariant
      });

      reported.push(reportedKey);
    }
  }

  return activeVariant;
}

const abSegmentPlugin: Plugin = (ctx, inject): void => {
  inject("abtest", experimentVariant);
};

export default abSegmentPlugin;
