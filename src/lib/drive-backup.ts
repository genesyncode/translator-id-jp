
import { dbService } from './indexeddb';
import { supabase } from './supabase';

class DriveBackupService {
  private accessToken: string | null = null;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.provider_token) {
      throw new Error('Google access token not available');
    }

    this.accessToken = session.provider_token;
    return this.accessToken;
  }

  private async findBackupFile(): Promise<string | null> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='genesync-backup.json'&spaces=appDataFolder`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    return data.files?.[0]?.id || null;
  }

  private async uploadBackupFile(content: string, fileId?: string): Promise<void> {
    const token = await this.getAccessToken();
    
    const metadata = {
      name: 'genesync-backup.json',
      parents: ['appDataFolder']
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));

    const url = fileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const method = fileId ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
  }

  private async downloadBackupFile(fileId: string): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return await response.json();
  }

  async backupAllToDrive(): Promise<void> {
    try {
      const data = await dbService.exportAllData();
      const jsonContent = JSON.stringify(data, null, 2);
      
      const existingFileId = await this.findBackupFile();
      await this.uploadBackupFile(jsonContent, existingFileId || undefined);
      
      console.log('Backup to Google Drive completed successfully');
    } catch (error) {
      console.error('Backup to Drive failed:', error);
      throw error;
    }
  }

  async restoreAllFromDrive(): Promise<void> {
    try {
      const fileId = await this.findBackupFile();
      if (!fileId) {
        console.log('No backup file found in Google Drive');
        return;
      }

      const backupData = await this.downloadBackupFile(fileId);
      await dbService.importAllData(backupData);
      
      console.log('Restore from Google Drive completed successfully');
    } catch (error) {
      console.error('Restore from Drive failed:', error);
      throw error;
    }
  }

  async scheduleAutoBackup(): Promise<void> {
    // Schedule backup every 24 hours
    const interval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    setInterval(async () => {
      try {
        await this.backupAllToDrive();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    }, interval);
  }
}

const driveBackupService = new DriveBackupService();

export const backupAllToDrive = () => driveBackupService.backupAllToDrive();
export const restoreAllFromDrive = () => driveBackupService.restoreAllFromDrive();
export const scheduleAutoBackup = () => driveBackupService.scheduleAutoBackup();

// Start auto backup when module loads
scheduleAutoBackup();
