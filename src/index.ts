export type {
  FallbackPolicy,
  RegionId,
  Scenario,
  SimulationInput,
  SimulationSummary
} from './types.js';

export { runSimulation, comparePolicies } from './engine.js';
export { renderMarkdownReport } from './report.js';
