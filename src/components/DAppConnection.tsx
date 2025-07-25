import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Shield, Eye, Send, X, Check } from 'lucide-react';
import { Wallet, DAppConnectionRequest } from '../types/wallet';
import { useToast } from '@/hooks/use-toast';

interface DAppConnectionProps {
  connectionRequest: DAppConnectionRequest;
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  onWalletSelect: (wallet: Wallet) => void;
  onApprove: (wallet: Wallet) => void;
  onReject: () => void;
}

export function DAppConnection({ 
  connectionRequest, 
  wallets, 
  selectedWallet, 
  onWalletSelect, 
  onApprove, 
  onReject 
}: DAppConnectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!selectedWallet) {
      toast({
        title: "No Wallet Selected",
        description: "Please select a wallet to connect",
        variant: "destructive",
      });
      return;
    }

    console.log('DAppConnection: Approving connection for wallet:', selectedWallet.address);
    
    setIsProcessing(true);
    try {
      onApprove(selectedWallet);
    } catch (error) {
      console.error('Connection approval error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to approve connection",
        variant: "destructive",
      });
      setIsProcessing(false);
    } finally {
      // Don't set isProcessing to false here since we're redirecting
    }
  };

  const handleReject = () => {
    console.log('DAppConnection: Rejecting connection');
    setIsProcessing(true);
    onReject();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'view_address':
        return <Eye className="h-4 w-4" />;
      case 'view_balance':
        return <Eye className="h-4 w-4" />;
      case 'call_methods':
        return <Send className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getPermissionDescription = (permission: string) => {
    switch (permission) {
      case 'view_address':
        return 'View the address of your permitted account';
      case 'view_balance':
        return 'View the balance of your permitted account';
      case 'call_methods':
        return 'Call methods on the smart contract on behalf of your permitted account';
      default:
        return permission;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {connectionRequest.appIcon ? (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={connectionRequest.appIcon} />
                  <AvatarFallback>
                    {connectionRequest.appName?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                  <ExternalLink className="h-8 w-8 text-primary-foreground" />
                </div>
              )}
            </div>
            <CardTitle className="text-xl">
              {connectionRequest.appName || 'Unknown App'} wants to connect
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {connectionRequest.origin}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Wallet Selection */}
            <div className="space-y-3">
              <h3 className="font-medium">Select Account</h3>
              <div className="max-h-[150px] w-full overflow-y-auto rounded-md border">
                <div className="p-2 space-y-2">
                  {wallets.map((wallet, index) => (
                    <div
                      key={wallet.address}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedWallet?.address === wallet.address
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => onWalletSelect(wallet)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Account {index + 1}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {truncateAddress(wallet.address)}
                          </div>
                        </div>
                        {selectedWallet?.address === wallet.address && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissions */}
            <div className="space-y-3">
              <h3 className="font-medium">This app will be able to:</h3>
              <div className="space-y-2">
                {connectionRequest.permissions.map((permission, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getPermissionIcon(permission)}
                    </div>
                    <span className="text-sm">
                      {getPermissionDescription(permission)}
                    </span>
                  </div>
                ))}
                
                {/* Always show this restriction */}
                <div className="flex items-start gap-3 text-muted-foreground">
                  <X className="h-4 w-4 mt-0.5" />
                  <span className="text-sm">
                    This does not allow the app to transfer tokens
                  </span>
                </div>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Only connect to websites you trust. This connection will allow the app to view your account information and request transactions.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing || !selectedWallet}
                className="flex-1"
              >
                {isProcessing ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}