#!/bin/sh
RUNNING_MODE='normal'
if [ $2 ]
then
	RUNNING_MODE=$2
fi

stop(){
	forever stopall
	cd /home/sary/server/csi-tso-server-onem2m/apache-tomcat-8.5.16/bin
	./shutdown.sh
	sleep 5
}
start(){
	cd /home/sary/server/csi-tso-server-onem2m/apache-tomcat-8.5.16/bin
	./startup.sh
	sleep 10

	cd /home/sary/server/csi-tso-server-dc-plus/
	git reset HEAD --hard
	git pull
	npm install
	
	cd /home/sary/server/csi-tso-server-collector/
	git reset HEAD --hard
	git pull
	npm install
	
	cd /home/sary
	forever start server/csi-tso-server-dc-plus/bin/srs-dc-plus --env=prod --mode=$RUNNING_MODE
	forever start server/csi-tso-server-collector/bin/srs-collector --env=prod --mode=$RUNNING_MODE
	forever list
}

status(){
	forever list
}

case "$1" in
	'start')
		start
		;;
	'stop')
		stop
		;;
	'restart')
		stop; echo "Sleeping..."; sleep 2;
		start
		;;
	'status')
		status
	;;
	*)
		echo
		echo "Usage: $0 {start|stop|restart|status}"
		echo
		exit 1
esac
exit 0