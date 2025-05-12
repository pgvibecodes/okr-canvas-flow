import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2 } from 'lucide-react';
const AuthPanel = ({
  onSuccess
}: {
  onSuccess: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      toast.success('Verification email sent! Please check your inbox.');
      onSuccess();
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Sign up failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success('Signed in successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Sign in failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">📯Horn OKR Please</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </> : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Up...
                  </> : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-500">
        <p className="w-full">
          Your OKR data will be safely stored in the cloud!
        </p>
      </CardFooter>
    </Card>;
};
export default AuthPanel;