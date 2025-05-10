
import React, { useState, useEffect } from 'react';
import OKRBoard from '../components/OKRBoard';
import AuthPanel from '../components/AuthPanel';
import { supabase } from '../services/supabaseClient';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      
      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
      });
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkSession();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {session ? (
        <>
          <div className="flex justify-end p-2 bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {session.user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <OKRBoard />
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center p-4">
          <AuthPanel onSuccess={() => {}} />
        </div>
      )}
    </div>
  );
};

export default Index;
