#! /bin/bash
rm -rf *.tar
tar cvf dc.tar *
scp -C -i "/d/dev_common/aws-keypair/iotmeca_sshbash.pem" ./dc.tar centos@52.79.123.146:~
ssh    -i "/d/dev_common/aws-keypair/iotmeca_sshbash.pem" centos@52.79.123.146 './up.sh dc'
ssh -t -i "/d/dev_common/aws-keypair/iotmeca_sshbash.pem" centos@52.79.123.146 './goto_auto.sh dc ./update-service.sh'

