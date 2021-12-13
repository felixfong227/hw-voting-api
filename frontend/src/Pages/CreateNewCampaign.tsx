import { LocalizationProvider, DesktopDatePicker } from "@mui/lab";
import { Typography, Alert, TextField, Button, Box, CircularProgress, Container, IconButton } from "@mui/material";
import dayjs from "dayjs";
import { isEmpty, isEqual, uniqWith } from "lodash";
import { useState, useContext, Fragment } from "react";
import { useFetch } from "react-async";
import { AuthContext } from "../Context/Auth";
import DateAdapter from '@mui/lab/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router";
import DeleteIcon from '@mui/icons-material/Delete';

let optoinCounter = 1;

type Option = {
    name: string;
    error?: string;
}

type PollOption = {
    [idx: number]: Option;
}

function CreatePollOptions({
    pollOptions,
    setPollOptions, 
    sendCampaignCreationRequest,
    isSending
}: { 
    pollOptions: PollOption, 
    setPollOptions: (pollOptions: PollOption) => void,
    sendCampaignCreationRequest: Function,
    isSending: boolean
}) {
    
    const render: JSX.Element[] = [];
    const [ inputError, setInputError ] = useState<string>("");
    let isOptionValid = true;
    let optionIndex = 0;
    
    function updateSingleOption(idx: number, option: Option) {
        const newPollOptions = { ...pollOptions, [idx]: option };
        setPollOptions(newPollOptions);
    }

    function inputBoxOnChange(idx: number, e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        const value = e.target.value;
        const option = pollOptions[idx];
        option.name = value;
        updateSingleOption(idx, option);
    }
    
    function addOption() {
        optoinCounter++;
        updateSingleOption(optoinCounter, { name: "" });
    }
    
    function submitValidation() {
        let hasError = false;
        for(const key in pollOptions) {
            const option = pollOptions[key];
            
            option.name = option.name.trim();
            option.error = "";
            
            // check if input is empty
            if(isEmpty(option.name)) {
                pollOptions[key].error = "Option cannot be empty";
                updateSingleOption(parseInt(key), pollOptions[key]);
                hasError = true;
            }
            
            // check if input is less then 50 characters
            if(option.name.length > 50) {
                pollOptions[key].error = "Option cannot be more then 50 characters";
                updateSingleOption(parseInt(key), pollOptions[key]);
                hasError = true;
            }
            
            updateSingleOption(parseInt(key), pollOptions[key]);
            
        }

        const normalizedPollOptions = [];
        
        for(const idx in pollOptions) {
            const option = pollOptions[idx];
            normalizedPollOptions.push({
                name: option.name,
            });
        }
        
        const uniqueOptions = uniqWith(normalizedPollOptions, isEqual);
        
        if(uniqueOptions.length !== normalizedPollOptions.length) {
            setInputError("Options cannot be duplicated");
            hasError = true;
        }
        
        if(hasError) return isOptionValid = false;
        return isOptionValid = true;
    }
    
    function submit() {
        submitValidation();
        sendCampaignCreationRequest(isOptionValid);
    }
    
    function deleteOption(idx: number) {
        const newPollOptions = { ...pollOptions };
        delete newPollOptions[idx];
        setPollOptions(newPollOptions);
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
                {
                        (optionIndex > 0) ? (
                                <IconButton onClick={() => deleteOption(Number(idx))} disabled={isSending}>
                                    <DeleteIcon />
                                </IconButton>
                        ): null
                }
                <Box mt={2} />
            </Fragment>
        );
        optionIndex++;
    }
    
    return (
        <Fragment>
            {
                inputError ? (
                    <Alert severity="error">{inputError}</Alert>
                ): null
            }
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
    const [ expireDateError, setExpireDateError ] = useState('');
    const navigate = useNavigate();
    
    const [ pollOptions, setPollOptions ] = useState<PollOption>({1: { name: "" }});
    
    const oneWeekLater = dayjs().add(1, 'week');
    
    function updateExpireDate(newDate: dayjs.Dayjs | null) {
        if(!newDate) return setExpireDateError("Expire date cannot be empty");
        if(!newDate.isValid()) return setExpireDateError("Invalid date");
        if(newDate.isAfter(oneWeekLater)) return setExpireDateError("Expire date cannot be more than one week later");
        if(newDate.isBefore(dayjs())) return setExpireDateError("Expire date cannot be before today");
        setExpireDateError("");
        setExpireDate(newDate);
    }
    
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
    
    function promptError(msg: string) {
        console.log(msg);
        setClientError("You fucked up UwU");
    }


    return (
        <Container>

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
                <DesktopDatePicker
                    renderInput={(props) => <TextField {...props} error={expireDateError ? true : false} helperText={expireDateError ? expireDateError : ''} />}
                    inputFormat="DD/MM/YYYY"
                    value={expireDate}
                    onChange={(newValue) => updateExpireDate(newValue)}
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
        </Container>
    );
}