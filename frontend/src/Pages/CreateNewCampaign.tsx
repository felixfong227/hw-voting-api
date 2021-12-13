import { LocalizationProvider, DatePicker } from "@mui/lab";
import { Typography, Alert, TextField, Button, Box, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { useState, useContext, Fragment } from "react";
import { useFetch } from "react-async";
import { AuthContext } from "../Context/Auth";
import DateAdapter from '@mui/lab/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import { css } from '@emotion/react';
import { useNavigate } from "react-router";

let optoinCounter = 1;

type Option = {
    name: string;
    error?: string;
}

type PollOption = {
    [idx: number]: Option;
}

function CreatePollOptions({ pollOptions, setPollOptions, sendCampaignCreationRequest, isSending }: { pollOptions: PollOption, setPollOptions: (pollOptions: PollOption) => void, sendCampaignCreationRequest: Function, isSending: boolean }) {
    
    const render: JSX.Element[] = [];
    let isOptionValid = true;
    
    function updateSingleOption(idx: number, option: Option) {
        const newPollOptions = { ...pollOptions, [idx]: option };
        setPollOptions(newPollOptions);
        pollOptions = newPollOptions;
    }

    function inputBoxOnChange(idx: number, e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = e.target.value;
        const option = pollOptions[idx];
        option.name = value.trim();
        updateSingleOption(idx, option);
    }
    
    function addOption() {
        optoinCounter++;
        updateSingleOption(optoinCounter, { name: "" });
    }
    
    function submitValidation() {
        for(const key in pollOptions) {
            const option = pollOptions[key];
            
            option.error = "";
            
            // check if input is empty
            if(isEmpty(option.name)) {
                pollOptions[key].error = "Option cannot be empty";
                updateSingleOption(parseInt(key), pollOptions[key]);
                return isOptionValid = false;
            }
            
            // check if input is less then 50 characters
            if(option.name.length > 50) {
                pollOptions[key].error = "Option cannot be more then 50 characters";
                updateSingleOption(parseInt(key), pollOptions[key]);
                return isOptionValid = false;
            }
            
            updateSingleOption(parseInt(key), pollOptions[key]);
            
        }
        
        return isOptionValid = true;
    }
    
    function submit() {
        submitValidation();
        sendCampaignCreationRequest(isOptionValid);
    }
    
    for(const idx in pollOptions) {
        const option = pollOptions[idx];

        render.push(
            <Fragment>
                <Box mt={2} />
                <TextField 
                    key={`poll-option-${idx}`}
                    placeholder="Option value"
                    value={option.name}
                    variant="standard" 
                    onChange={(e) => inputBoxOnChange(Number(idx), e)}
                    error={option.error ? true : false}
                    helperText={option.error}
                    disabled={isSending}
                />
                <Box mt={2} />
            </Fragment>
        );
    }
    
    return (
        <Fragment>
            {render}
            <Button disabled={isSending} variant="contained" color="secondary" onClick={() => addOption()}>
                <AddIcon />
            </Button>
            <Box mt={2} />
            <Button
                variant="contained"
                color="primary"
                onClick={() => submit()}
                disabled={isSending}
            >
                Submit
            </Button>
            {
                isSending ? (
                    <Fragment>
                        <CircularProgress 
                            size={20}
                            style={{
                                marginLeft: '10px',
                            }}
                        />
                    </Fragment>
                ) : null
            }
        </Fragment>
    );
    
}

export function CreateNewCampaign() {
    
    const [ expireDate, setExpireDate ] = useState(dayjs());
    const { HKIDHash } = useContext(AuthContext);
    const [ name, setName ] = useState('');
    const [ clientError, setClientError ] = useState('');
    const navigate = useNavigate();
    
    const [ pollOptions, setPollOptions ] = useState<PollOption>({1: { name: "" }});
    
    const oneWeekLater = dayjs().add(1, 'week');
    
    const normalizedPollOptions = [];
    
    for(const idx in pollOptions) {
        const option = pollOptions[idx];
        normalizedPollOptions.push({
            name: option.name,
        });
    }
    
    const { error, run, isLoading } = useFetch<any>('http://localhost:8080/campaigns/create', {
        method: 'POST',
        headers: {
            'X-HKIDHash': HKIDHash ?? '',
            'Content-Type': 'application/json',
            accept: 'application/json'
        },
        body: JSON.stringify({
            name,
            expireDate: expireDate.toISOString(),
            pollOptions: normalizedPollOptions,
        }),
    }, { json: true, onResolve: () => navigate('/') });
    
    function sendCampaignCreationRequest(isOptionValid: boolean) {
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
        if(!isOptionValid) return false;
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
            
            <TextField value={name} 
                onChange={target => setName(target.target.value ?? '')}
                label="Campaign Name"
                variant="outlined" 
                disabled={isLoading}
            />
            <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                    renderInput={(props) => <TextField {...props} />}
                    value={expireDate}
                    onChange={(newValue) => {
                        setExpireDate(newValue ?? dayjs())
                    }}
                    maxDate={oneWeekLater}
                    minDate={dayjs()}
                    disabled={isLoading}
                />
            </LocalizationProvider>
            
            <Box mt={2} />
            
            <CreatePollOptions
                pollOptions={pollOptions}
                setPollOptions={setPollOptions}
                sendCampaignCreationRequest={sendCampaignCreationRequest}
                isSending={isLoading}
            />
            
            {/* <Button disabled={isLoading} variant="contained" color="primary" onClick={_ => sendCampaignCreationRequest()}>Create</Button> */}
        </Fragment>
    );
}