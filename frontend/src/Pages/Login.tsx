import { Alert, Button, Container, TextField, Typography } from '@mui/material';
import { isEmpty, isNil, isString } from 'lodash';
import { useContext, useState } from 'react';
import { AuthContext } from '../Context/Auth';

function LoginPage() {
  
  const UseAuthContext = useContext(AuthContext);  
  const [ inputHKID, setInputHKID ] = useState<string | null>(null);
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  
  const ERROR_PROMPT_TIME = 5 * 1000;
  
  if(UseAuthContext === null) {
    // the user auth context is still not being initialized
    throw new Error('The user auth context is not initialized');
  }
  
  function clientValidaction() {
    const regex = /(^\w\d|^\w\w)(\d)+\((\w|\d)\)/;
    
    if(isNil(inputHKID)) {
      setErrorMsg('Please input your HKID');
      return false;
    }
    
    if(inputHKID.length < 8) {
      setErrorMsg("Your HKID is too short");
      return false;
    }
    
    if(!regex.test(inputHKID)) {
      setErrorMsg('Invalid HKID format');
      return false;
    }
    
    return true;
  }
  
  function promptError(msg: string) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), ERROR_PROMPT_TIME);
  }
  
  async function sendUserCreateRequest(HKID: string) {
    setIsLoading(true);
    if(isNil(HKID) && isEmpty(HKID)) {
      promptError('Please enter your HKID');
      return;
    }
    const url = 'http://localhost:8080/users/create';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          HKID,
        }),
        credentials: 'omit',
      });
      const json = await response.json();

      if(!response.ok) {
        promptError(`Fail to create an account: ${json.message.toString()}`);
        return;
      }
      
      // successfully create an account
      const { HKIDHash } = json;
      
      if(isNil(HKIDHash) || isEmpty(HKIDHash) || !isString(HKIDHash)) {
        promptError('Fail to create an account: HKIDHash is empty');
        return;
      }

      localStorage.setItem('HKIDHash', HKIDHash);
      UseAuthContext?.setHKIDHash(HKIDHash);
      window.location.reload();
    } catch (err: any) {
      promptError(`Network error: ${err}`);
      console.error(err?.text);
    } finally {
      setIsLoading(false);
    }
  }
  
  function loginButtonOnClick() {
    const valid = clientValidaction();
    if(valid) sendUserCreateRequest(inputHKID ?? '');
  }

  return (
        <Container maxWidth="sm">
          {
            errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null
          }
          <Typography>Please Enter Your HKID</Typography>
          <br />
          <TextField value={inputHKID ?? ""} onChange={(e) => setInputHKID(e.target.value)} helperText="Example: A1234567(8)" required label="HKID" />
          <br />
          <br />
          <Button disabled={isLoading} variant="contained" onClick={_ => loginButtonOnClick()}>Login</Button>
        </Container>
  );
}

export default LoginPage;
