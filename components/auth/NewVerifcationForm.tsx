'use client';

import { newVerification } from '@/actions/new-Verification';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import { FormError } from '../form-error';
import { FormSuccess } from '../form-success';
import { CardWrapper } from './card-wrapper';

const NewVerifcationForm = () => {
  const [error, setError] = useState('');
  const [sucess, setSucess] = useState('');
  const searchPArams = useSearchParams();
  const token = searchPArams.get('token');

  const onSubmit = useCallback(() => {
    if (sucess || error) return;
    if (!token) {
      setError('Invalid token');
      return;
    }
    newVerification(token)
      .then((res) => {
        setError(res.error || '');
        setSucess(res.success || '');
      })
      .catch((err) => {
        setError('An error occured');
      });
  }, [token, sucess, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);
  return (
    <CardWrapper
      headerLabel="Confirm your verification"
      backButtonLabel="Back to Login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center justify-center w-full">
        {!sucess && !error && <BeatLoader color="#000" />}
        <FormSuccess message={sucess} />
        {!sucess && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};

export default NewVerifcationForm;
