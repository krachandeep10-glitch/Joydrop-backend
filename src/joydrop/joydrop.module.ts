import { Module } from "@nestjs/common";
import { JoydropController } from "./joydrop.controller";
import { JoydropService } from "./joydrop.service";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
  imports: [FirebaseModule],
  controllers: [JoydropController],
  providers: [JoydropService],
  exports: [JoydropService],
})
export class JoydropModule {}
