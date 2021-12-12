import { Card, CardContent, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function CampaignCard({ campaign }: { campaign: any }) {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
          <Typography variant="h4">{campaign.name}</Typography>
          <div>
            <AccessTimeIcon /><Typography component="span"> {dayjs(campaign.creation_date).fromNow()}</Typography>
            <br />
            <DeleteIcon /><Typography component="span"> {dayjs(campaign.expire_date).fromNow()}</Typography>
          </div>
      </CardContent>
    </Card>
  );
}