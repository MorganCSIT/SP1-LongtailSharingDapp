import React, { Component } from 'react'
import {
  Card,
  Grid,
  Button,
  Divider,
  Form,
  Message,
  Input,
} from 'semantic-ui-react'
import Layout from '../../../components/Layout'
import Trip from '../../../ethereum/trip'
import web3 from '../../../ethereum/web3'
import { Router } from '../../../routes'
import CaptainConfirmForm from '../../../components/CaptainConfirmForm'

class CaptainCorner extends Component {
  static async getInitialProps(props) {
    const trip = Trip(props.query.address)

    const summary = await trip.methods.getSummary().call()

    return {
      address: props.query.address,
      boatPrice: summary[0],
      deposit: summary[1],
      captain: summary[2],
      totalBalance: summary[3],
      reserved: summary[4],
      refunded: summary[5],
      confirmed: summary[6],
      description: summary[7],
      client: summary[8],
    }
  }

  renderCards() {
    const {
      boatPrice,
      deposit,
      captain,
      totalBalance,
      reserved,
      refunded,
      confirmed,
      description,
      client,
    } = this.props

    const items = [
      {
        header: 'Captain Address',
        meta: '',
        description: captain,
        style: { overflowWrap: 'break-word' },
      },
      {
        header: 'Reserved?',
        meta: '',
        description: reserved.toString(),
        style: { overflowWrap: 'break-word' },
      },
      {
        header: 'Trip Info',
        meta: '',
        description: description,
        style: { overflowWrap: 'break-word' },
      },
      {
        header: 'Refunded?',
        meta: '-',
        description: refunded.toString(),
        style: { overflowWrap: 'break-word' },
      },
      {
        header: 'Confirmed?',
        meta: '-',
        description: confirmed.toString(),
        style: { overflowWrap: 'break-word' },
      },
      {
        header: 'Trip balance',
        meta: '-',
        description: totalBalance,
        style: { overflowWrap: 'break-word' },
      },
    ]

    return <Card.Group items={items} />
  }

  state = {
    description: '',
    errorMessage: '',
    loading: false,
  }

  onSubmit = async (event) => {
    event.preventDefault()
    const trip = Trip(this.props.address)

    this.setState({ loading: true, errorMessage: '' })

    const { description } = this.state

    try {
      const accounts = await web3.eth.getAccounts()
      await trip.methods.setDescription(description).send({ from: accounts[0] })

      Router.replaceRoute(`/trips/${this.props.address}/captain`)
    } catch (err) {
      this.setState({ errorMessage: err.message })
    }
    this.setState({ loading: false, message: '' })
  }

  onApproveRefund = async () => {
    const trip = Trip(this.props.address)

    const accounts = await web3.eth.getAccounts()
    await trip.methods.approveRefund().send({
      from: accounts[0],
    })
  }

  render() {
    return (
      <Layout>
        <Grid>
          <Grid.Column>
            {this.renderCards()}
            <Divider></Divider>
            <Grid.Row>
              <CaptainConfirmForm address={this.props.address} />
            </Grid.Row>
            <Divider></Divider>
            <Grid.Row>
              <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Field>
                  <label>Edit description</label>
                  <Input
                    value={this.state.description}
                    onChange={(event) =>
                      this.setState({ description: event.target.value })
                    }
                    label="text"
                    labelPosition="right"
                  />
                </Form.Field>
                <Message
                  error
                  header="Oops!"
                  content={this.state.errorMessage}
                />
                <Button loading={this.state.loading} color="orange">
                  Edit!
                </Button>
              </Form>
            </Grid.Row>
            <Grid.Row>
              <Button
                style={{ marginTop: 10 }}
                color="black"
                onClick={this.onApproveRefund}
              >
                Confirm Refund
              </Button>
            </Grid.Row>
            <Divider></Divider>
            <Button style={{ marginBottom: 10 }} color="purple" fluid>
              Captains's Corner
            </Button>
          </Grid.Column>
        </Grid>
      </Layout>
    )
  }
}

export default CaptainCorner
