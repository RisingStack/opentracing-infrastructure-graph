'use strict'

const MetricsTracer = require('@risingstack/opentracing-metrics-tracer')

const prometheusReporter = new MetricsTracer.PrometheusReporter()
const metricsTracer = new MetricsTracer('my-server-2', [prometheusReporter])

// Auto instrumentation
const Instrument = require('@risingstack/opentracing-auto')

new Instrument({
  tracers: [metricsTracer]
})

// Web server
const express = require('express')

const app = express()
const port = process.env.PORT || 3003

app.get('/', async (req, res) => {
  res.json({
    status: 'ok'
  })
})

app.get('/metrics', (req, res) => {
  res.set('Content-Type', MetricsTracer.PrometheusReporter.Prometheus.register.contentType)
  res.end(prometheusReporter.metrics())
})

app.listen(port, (err) => {
  console.log(err || `Server 1 is listening on ${port}`)
})
