import { runScenario } from '../src/simulator';

const r = runScenario('packet_loss');
if (r.status !== 'stub') throw new Error('simulator stub failed');
