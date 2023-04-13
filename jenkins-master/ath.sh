#!/usr/bin/bash
set -o errexit
set -o nounset
set -o pipefail
set -o xtrace
cd "$(dirname "$0")"

# https://github.com/jenkinsci/acceptance-test-harness/releases
export ATH_VERSION=5537.v26d6599fdc59

MVN='mvn -B -ntp -Pquick-build -am -pl war package'
if [[ -n ${MAVEN_SETTINGS-} ]]; then
	MVN="${MVN} -s ${MAVEN_SETTINGS}"
fi

[[ -f war/target/jenkins.war ]] || $MVN

mkdir -p target/ath-reports
chmod a+rwx target/ath-reports

exec docker run --rm \
	--env ATH_VERSION \
	--shm-size 2g `# avoid selenium.WebDriverException exceptions like 'Failed to decode response from marionette' and webdriver closed` \
	--volume "$(pwd)"/war/target/jenkins.war:/jenkins.war:ro \
	--volume /var/run/docker.sock:/var/run/docker.sock:rw \
	--volume "$(pwd)"/target/ath-reports:/reports:rw \
	--interactive \
	jenkins/ath:"$ATH_VERSION" \
	bash <<-'INSIDE'
		set -o errexit
		set -o nounset
		set -o pipefail
		set -o xtrace
		cd
		# Start the VNC system provided by the image from the default user home directory
		eval "$(vnc.sh)"
		env | sort
		git clone --branch "$ATH_VERSION" --depth 1 https://github.com/jenkinsci/acceptance-test-harness
		cd acceptance-test-harness
		run.sh firefox /jenkins.war \
			-Dmaven.test.failure.ignore \
			-DforkCount=1 \
			-Dgroups=org.jenkinsci.test.acceptance.junit.SmokeTest
		cp --verbose target/surefire-reports/TEST-*.xml /reports
	INSIDE
