import React, { Component } from 'react'
import Vizceral from 'vizceral-react'
import superagent from 'superagent'

import 'vizceral-react/dist/vizceral.css'
import './Topology.css'

const PROMETHEUS_QUERY = 'sum(rate(operation_duration_seconds_count{name="http_server"}[1m]))'
  + ' by (service, parent_service)  * 60'

const ROOT_NODE = {
  name: 'INTERNET'
}

const UPDATE_INTERVAL = 10000

class Topology extends Component {
  constructor () {
    super()

    this.updateInterval = setInterval(() => this.update(), UPDATE_INTERVAL)

    this.state = {
      traffic: {
        layout: 'ltrTree',
        maxVolume: 10000,
        updated: Date.now(),
        name: 'Infrastructure',
        renderer: 'region',
        nodes: [
          ROOT_NODE
        ],
        connections: []
      }
    }

    this.update()
  }

  componentWillUnmount () {
    clearInterval(this.updateInterval)
  }

  update () {
    const epoch = Math.round(Date.now() / 1000)
    const uri = 'http://localhost:9090/api/v1/query'
      + `?query=${PROMETHEUS_QUERY}&start=${epoch - 60}&end=${epoch}`

    superagent.get(uri)
      .then(({ body }) => {
        const { traffic } = this.state
        const nodes = new Set()

        traffic.updated = Date.now()

        traffic.nodes = [ROOT_NODE]
        traffic.connections = []

        body.data.result.forEach((result) => {
          // Add node
          if (!nodes.has(result.metric.service)) {
            traffic.nodes.push({
              name: result.metric.service
            })

            nodes.add(result.metric.service)
          }

          // Add edge
          traffic.connections.push({
            source: result.metric.parent_service === 'unknown' ? ROOT_NODE.name : result.metric.parent_service,
            target: result.metric.service,
            metrics: {
              normal: Math.round(Number(result.value[1]) || 0),
              danger: 0,
              warning: 0
            }
          })
        })

        this.setState({ traffic })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  render () {
    const { traffic } = this.state

    return (
      <div className="vizceral-container">
        <Vizceral
          traffic={traffic}
          showLabels
          allowDraggingOfNodes
        />
      </div>
    )
  }
}

export default Topology
