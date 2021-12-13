import { Card, CardContent, Typography, Box } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function CampaignCard({ campaign }: { campaign: any }) {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
          <Typography variant="h4">{campaign.name}</Typography>
          <Typography variant="subtitle1">Created {dayjs(campaign.creation_date).fromNow()}</Typography>
          <Box mt={2} />
          <AccessTimeIcon /><Typography component="span"> {dayjs(campaign.expire_date).fromNow()}</Typography>
      </CardContent>
    </Card>
  );
}