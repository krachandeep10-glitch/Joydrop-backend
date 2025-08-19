import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { PostsModule } from "./posts/posts.module";
import { FirebaseModule } from "./firebase/firebase.module";
import { JoydropModule } from "./joydrop/joydrop.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    FirebaseModule,
    UserModule,
    PostsModule,
    JoydropModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
