import React, { useState } from 'react';
import { Button, Form, Input, Grid, Label, Icon } from 'semantic-ui-react';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import { useSubstrate } from './substrate-lib';

import metadata from './config/erc20token.json';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ addressTo: null, amount: 0 });
  const { accountPair, contractAddress } = props;

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { addressTo, amount } = formState;

  const { api } = useSubstrate();
  const contract = new ContractPromise(api, new Abi(metadata), contractAddress);

  const execute_transfer = () => {
      const gasLimit = 100000000000;

      const setBalance = (state) => {
        contract.query.balanceOf(addressTo, 0, gasLimit, addressTo).then((balance) => {
            setStatus(`${state}.\n${addressTo} balance: ${balance.output.toNumber()}`);
        })
      }

      contract.tx.transfer(0, gasLimit, addressTo, amount)
        .signAndSend(accountPair, (result) => {
            if (result.status.isInBlock) {
                setBalance('Waiting in Block');
            } else if (result.status.isFinalized) {
                setBalance('Block Finalized');
            }
        });
  }

  return (
    <Grid.Column width={8}>
      <h1>ERC20 Token Transfer</h1>
      <Form>
        <Form.Field>
          <Label basic color='teal'>
            <Icon name='hand point right' />
            1 Unit = 1000000000000
          </Label>
        </Form.Field>
        <Form.Field>Transfer more than the existential amount for account with 0 balance</Form.Field>
        <Form.Field>
          <Input
            fluid
            label='To'
            type='text'
            placeholder='address'
            state='addressTo'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='Amount'
            type='number'
            state='amount'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <Button onClick={execute_transfer}>Submit</Button>
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}