import { Alert, Button, CircularProgress, Container, TextField, Typography } from "@mui/material";
import { Fragment, useContext, useState } from "react";
import { useFetch } from "react-async";
import { isArray, isEmpty } from "lodash";
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { DatePicker } from "@mui/lab";
import dayjs from "dayjs";
import { AuthContext } from "../Context/Auth";
import CampaignCard from "../Components/CampaignCard";

function CreateNewCampaign({ pushOneNewCampaign }: { pushOneNewCampaign: Function }) {
    
    const [ expireDate, setExpireDate ] = useState(dayjs());
    const { HKIDHash } = useContext(AuthContext);
    const [ name, setName ] = useState('');
    const [ clientError, setClientError ] = useState('');
    
    const oneWeekLater = dayjs().add(1, 'week');
    
    const { error, isLoading, run } = useFetch<any>('http://localhost:8080/campaigns/create', {
        method: 'POST',
        headers: {
            'X-HKIDHash': HKIDHash ?? '',
            'Content-Type': 'application/json',
            accept: 'application/json'
        },
        body: JSON.stringify({
            name,
            expireDate: expireDate.toISOString(),
        }),
    }, {json: true, onResolve: (data) => pushNewlyCreatedCampaign(data)});
    
    function pushNewlyCreatedCampaign(data: any) {
        pushOneNewCampaign(data);
    }
    
    function sendCampaignCreationRequest() {
        const trimedName = name.trim();
        setClientError('');
        setName(trimedName);
        if(isEmpty(trimedName)) {
            setClientError('Please enter a campaign name');
            return;
        }
        if(trimedName.length > 50) {
            setClientError('Name is too long, please keep it under 50 characters');
            return;
        }
        if(expireDate.isBefore(dayjs())) {
            setClientError('Expire date cannot be before today');
            return;
        }
        run();
    }

    return (
        <Fragment>

            <Typography variant="h6">
                Create new campaign
            </Typography>
            
            {
                error ? (
                    (() => {
                        return <Alert severity="error">Fail to create a new campaign: <b>{error.message}</b></Alert>
                    })()
                ) : null
            }

            {
                clientError ? (
                    (() => {
                        return <Alert severity="error">{clientError}</Alert>
                    })()
                ) : null
            }
            
            <TextField value={name} onChange={target => setName(target.target.value ?? '')} label="Campaign Name" variant="outlined"></TextField>
            <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                    renderInput={(props) => <TextField {...props} />}
                    value={expireDate}
                    onChange={(newValue) => {
                        setExpireDate(newValue ?? dayjs())
                    }}
                    maxDate={oneWeekLater}
                    minDate={dayjs()}
                />
            </LocalizationProvider>
            <Button disabled={isLoading} variant="contained" color="primary" onClick={_ => sendCampaignCreationRequest()}>Create</Button>
        </Fragment>
    );
}

export function CampaignsPage() {
    
    const { data, error, isLoading, setData } = useFetch('http://localhost:8080/campaigns', {
        method: 'GET',
    }, {json: true});
    
    function pushOneNewCampaign(campaign: any) {
        console.log('new campaign', campaign);
        const newCampaigns = [...data as any, campaign];
        console.log(newCampaigns);
        setData(newCampaigns);
    }

    return (
        <Container maxWidth="md">
            <br />
            <Typography variant="h4">Campaigns</Typography>
            <br />
            <CreateNewCampaign pushOneNewCampaign={pushOneNewCampaign} />
            <br />
            {
                (() => {
                    
                    if(isLoading) {
                        return <CircularProgress color="secondary" />;
                    }

                    if(error) {
                        return <Alert severity="error">Fail to fetch a list of campaigns from the server: {error.message}</Alert>
                    }
                    
                    if(!isArray(data)) {
                        return <Alert severity="error">Fail to fetch a list of campaigns from the server: Incorrect data</Alert>
                    }
                    
                    if(data.length === 0) {
                        return <Alert severity="info">No campaigns found</Alert>
                    }
                    
                    return data.map((campaign: any) => {
                        return <CampaignCard key={campaign.ID} campaign={campaign} />
                    });
                })()
            }
        </Container>
    );
}