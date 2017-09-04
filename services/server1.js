'use strict'

const MetricsTracer = require('@risingstack/opentracing-metrics-tracer')

const prometheusReporter = new MetricsTracer.PrometheusReporter()
const metricsTracer = new MetricsTracer('my-server-1', [prometheusReporter])

// Auto instrumentation
const Instrument = require('@risingstack/opentracing-auto')

new Instrument({
  tracers: [metricsTracer]
})

// Web server
const request = require('request-promise-native')
const express = require('express')

const app = express()
const port = process.env.PORT || 3001

app.get('/', async (req, res) => {
  const [server2Resp, server3Resp] = await Promise.all([
    request({
      uri: 'http://localhost:3002',
      json: true
    }),
    request({
      uri: 'http://localhost:3003',
      json: true
    })
  ])

  res.json({
    server2: server2Resp,
    server3: server3Resp,
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
