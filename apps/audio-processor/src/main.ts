import { createServer } from 'node:http';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { registry } from './shared/metrics/metrics.registry';

async function bootstrap() {
  const port = parseInt(process.env.PORT ?? '3001', 10);
  const metricsPort = parseInt(process.env.METRICS_PORT ?? '9101', 10);
  const logger = new Logger('AudioProcessor');

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port },
  });

  await app.listen();
  logger.log(`TCP microservice listening on port ${port}`);

  // Standalone HTTP server exposing `/metrics` for Prometheus scraping.
  // Kept on a separate port from the TCP microservice so the two
  // lifecycles stay independent and the metrics endpoint is firewalled
  // off from backend traffic.
  const metricsServer = createServer((req, res) => {
    if (req.url === '/metrics' && req.method === 'GET') {
      registry
        .metrics()
        .then((body) => {
          res.writeHead(200, { 'Content-Type': registry.contentType });
          res.end(body);
        })
        .catch((err: unknown) => {
          logger.error(`Failed to render metrics: ${String(err)}`);
          res.writeHead(500).end('metrics_error');
        });
      return;
    }
    res.writeHead(404).end('not_found');
  });
  metricsServer.listen(metricsPort, () => {
    logger.log(
      `Metrics endpoint listening on http://0.0.0.0:${metricsPort}/metrics`,
    );
  });
}

void bootstrap();
