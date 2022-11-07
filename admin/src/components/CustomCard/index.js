import * as React from 'react';
import { Typography, Button, Box } from '@strapi/design-system'
import { Check } from '@strapi/icons';
import { Card, CardContent, CardAction } from '@strapi/design-system/Card';
import './customcard.css'

export default function CustomCard(props) {
  return (
    <>
      <Card className='custom-card'>
        <Box className='custom-card-header'>
          <Typography>
            {props.data.title}
          </Typography>
        </Box>
        <CardContent className='custom-card-content'>
          {props.data.content.map((content, index) => (
            <Typography className='custom-card-label' key={index}>
              <Check className='check-icon' color='blue' />
              <span>{content}</span>
            </Typography>
          ))}
        </CardContent>
        <Button className='custom-card-btn' onClick={() => props.click()} disabled={props.loading || (props.accountID && props.data.btnLabel === 'Start Now')}>{props.data.btnLabel}</Button>
      </Card>
    </>
  );
}
