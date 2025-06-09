import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DownloadService {
  private blobServiceClient: BlobServiceClient;

  constructor(private readonly config: ConfigService) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.config.get<string>('AZURE_STORAGE_STRING') || '',
    );
  }

  // async downloadFile(contanerName: string): Promise<string> {
  //   const containerClient =
  //     this.blobServiceClient.getContainerClient(contanerName);

  //   const blobName = 'test.txt';
  //   const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  //   const downloadBlockBlobResponse = await blockBlobClient.download();
  //   const downloadedData = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
  // }
}
