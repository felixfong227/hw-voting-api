import { Alert, Button, CircularProgress, Container, Typography } from "@mui/material";
import { useFetch } from "react-async";
import { isArray } from "lodash";
import CampaignCard from "../Components/CampaignCard";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import { Fragment, useContext } from "react";
import { AuthContext } from "../Context/Auth";

export function CampaignsPage() {
    
    const navigate = useNavigate();
    
    const { HKIDHash } = useContext(AuthContext);
    
    const { data, error, isLoading } = useFetch('http://localhost:8080/campaigns', {
        method: 'GET',
        headers: {
            'X-HKIDHash': HKIDHash ?? '',
        }
    }, {json: true});

    return (
        <Container maxWidth="md">
            <Typography variant="h4">Campaigns</Typography>
            
            <Box mt={2} />
            
            <Button onClick={() => navigate('/new/campaign')} variant="contained" color="primary">Create New Campaign</Button>

            <Box mt={2} />

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
                        return (
                            <Fragment>
                                <Box mt={2} />
                                    <CampaignCard key={campaign.ID} campaign={campaign} />
                                <Box mt={2} />
                            </Fragment>
                        )
                    });
                })()
            }
        </Container>
    );
}