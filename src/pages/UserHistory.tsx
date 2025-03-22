
import { UserHistory } from '@/components/ui/UserHistory';
import { Layout } from '@/components/Layout';
import { Clock, FileArchive } from 'lucide-react';

const UserHistoryPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Historique de vos partages
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gérez les fichiers que vous avez partagés via By'Share
          </p>
        </div>
        
        <UserHistory />
      </div>
    </Layout>
  );
};

export default UserHistoryPage;
