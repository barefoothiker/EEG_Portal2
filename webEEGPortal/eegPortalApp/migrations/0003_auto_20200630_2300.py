# Generated by Django 2.2 on 2020-06-30 23:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('eegPortalApp', '0002_auto_20200625_2309'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='analysisdetail',
            name='channelNum',
        ),
        migrations.CreateModel(
            name='AnalysisDetailChannel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('channelName', models.CharField(blank=True, max_length=255, null=True)),
                ('uploadFolder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='eegPortalApp.AnalysisDetail')),
            ],
        ),
    ]