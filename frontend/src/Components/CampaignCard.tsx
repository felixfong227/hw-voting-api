import { Card, CardContent, Typography, Box, Button, CardActions, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert, FormControl } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useFetch } from "react-async";
import { Fragment, useContext, useEffect, useState } from "react";
import { AuthContext } from "../Context/Auth";
dayjs.extend(relativeTime);

function ListOfOptions(
  {
    campaignID,
  }: {
    campaignID: string;
  }
) {
  
  const { data, error, isLoading } = useFetch(`http://localhost:8080/campaigns/${campaignID}/options`, { method: 'GET' }, { json: true});
  
  const [ voteID, setVoteID ] = useState<string | null>(null);
  
  const { HKIDHash } = useContext(AuthContext);
  
  const { error: voteError, isLoading: voteIsLoading, isFulfilled, run } = useFetch(`http://localhost:8080/campaigns/${campaignID}/votes`, 
    {
      method: 'POST',
      headers: {
        "X-HKIDHash": HKIDHash,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        optionsID: voteID ?? '',
      }),
    },
    { json: true}
  );
  
  function caseAVote() {
    run();
  }
  
  function renderAListOfOptions() {
    const render: JSX.Element[] = [];
    for(const option of data as any) {
      render.push(
        <FormControlLabel
          key={option.ID}
          control={<Radio />}
          label={option.name}
          checked={voteID === option.ID}
          onChange={() => setVoteID(option.ID)}
        />
      );
    }
    return render;
  }
  
  return (
      <FormControl disabled={voteIsLoading || isFulfilled }>
        
        {
          voteError ? (
            <Alert severity="error">Fail to cast a vote: <b>{voteError.message}</b></Alert>
          ) : null
        }        
        
        {
          isFulfilled ? (
            <Alert severity="success">Thank you for voting</Alert>
          ) : null
        }

        <RadioGroup defaultChecked={false} defaultValue={null}>
          {
            isLoading ? (
              <CircularProgress />
            ) : renderAListOfOptions()
          }
          
          {
            error ? (
              <Alert severity="error">Fail to load a list of poll options: <b>{error.message}</b></Alert>
            ) : null
          }
        </RadioGroup>
        {
          voteID ? (
            <Button disabled={voteIsLoading || isFulfilled} variant="contained" onClick={() => caseAVote()}>Vote</Button>
          ) : null
        }
      </FormControl>
  );
}

export default function CampaignCard({ campaign }: { campaign: any }) {
  
  const { data, error, isLoading, run: getVoteResults } = useFetch(`http://localhost:8080/campaigns/${campaign.ID}/votes`,
    { method: 'GET' },
    {
      json: true,
      onResolve: (data) => {
        setVoteResults(data);
      },
    }
  );
  
  const [ voteResults, setVoteResults ] = useState<any>(null);
  
  if(dayjs(campaign.expire_date).isBefore(dayjs())) {
    // campaign is expired, show the results
    getVoteResults();
  }
  
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
          <Typography variant="h4">{campaign.name}</Typography>
          <Typography variant="subtitle1">Created {dayjs(campaign.creation_date).fromNow()}</Typography>
          <Box mt={2} />
          <AccessTimeIcon /><Typography component="span"> {dayjs(campaign.expire_date).fromNow()}</Typography>
      </CardContent>
      
      {
        (() => {
          if(voteResults) {
            return (data as any).map((vote: any) => {
              return (
                <Typography>{vote.name}: {vote.Vote.length} votes</Typography>
              );
            });
          } else {
            if(campaign.voted) {
              return (
                <Fragment>
                  <Alert severity="info">You have already voted for this poll</Alert>
                  <br />
                  <Box />
                </Fragment>
              )
            } else {
              return (
                <CardActions>
                  <ListOfOptions campaignID={campaign.ID} />
                </CardActions>
              )
            }
          }
        })()
      }      
    </Card>
  );
}